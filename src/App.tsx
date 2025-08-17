// app.tsx
// comentarios en minusculas y sin tildes
import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import SubjectGrid from './components/SubjectGrid';
import SubjectModal from './components/SubjectModal';
import SearchBar from './components/SearchBar';
import ProgressSummary from './components/ProgressSummary';
import { curriculumData as baseCurriculumData } from './data/curriculumData';
import { Subject } from './types';

function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());

  // utils
  const norm = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const eq = (a: string, b: string) => norm(a) === norm(b);

  // reglas globales
  const isProfessionalElective = (s: Subject) => norm(s.name).includes('electivo profesional');
  const isEmprendimiento = (s: Subject) => norm(s.name).includes('emprendimiento');
  const requiresFirstThreeCompleted = (s: Subject) => isProfessionalElective(s) || isEmprendimiento(s);

  // meta prerrequisito: texto tipo "haber completado todos los semestres anteriores"
  const isMetaAllPrevSemesters = (txt: string) => norm(txt).includes('semestres anteriores');

  // clonar y parchear data sin tocar el json original
  const curriculumData = useMemo(() => {
    const clone = JSON.parse(JSON.stringify(baseCurriculumData)) as typeof baseCurriculumData;

    Object.values(clone).forEach(sem => {
      sem.subjects = sem.subjects.map(s => {
        // formaciones generales
        if (s.name === 'Formación General Comunicacional II') {
          const reqs = new Set([...(s.prerequisites || [])]);
          reqs.add('Formación General Comunicacional I');
          return { ...s, prerequisites: Array.from(reqs) };
        }
        if (s.name === 'Formación General Valórica II') {
          const reqs = new Set([...(s.prerequisites || [])]);
          reqs.add('Formación General Valórica I');
          return { ...s, prerequisites: Array.from(reqs) };
        }
        if (s.name === 'Formación General Valórica III') {
          const reqs = new Set([...(s.prerequisites || [])]);
          reqs.add('Formación General Valórica II');
          return { ...s, prerequisites: Array.from(reqs) };
        }

        // parches pedidos
        if (s.name === 'Estadística') {
          const reqs = new Set([...(s.prerequisites || [])]);
          reqs.add('Cálculo II');
          return { ...s, prerequisites: Array.from(reqs) };
        }

        if (s.name === 'Arquitectura de Computadores') {
          const reqs = new Set([...(s.prerequisites || [])]);
          reqs.add('Álgebra II');
          return { ...s, prerequisites: Array.from(reqs) };
        }

        return s;
      });
    });

    return clone;
  }, []);

  const getAllSubjects = (): Subject[] => Object.values(curriculumData).flatMap(s => s.subjects);

  // helper: todos los ramos hasta un semestre estan aprobados
  const hasApprovedUpToSemester = (limit: number, completed: Set<string>) => {
    const completedNorm = new Set(Array.from(completed).map(norm));
    return getAllSubjects()
      .filter(s => s.semester <= limit)
      .every(s => completedNorm.has(norm(s.name)));
  };

  // disponible si cumple reglas globales, meta regla y prerrequisitos reales exactos
  const isSubjectAvailable = (subject: Subject): boolean => {
    // regla global para electivos profesionales y emprendimiento
    if (requiresFirstThreeCompleted(subject) && !hasApprovedUpToSemester(3, completedSubjects)) {
      return false;
    }

    const prereqs = subject.prerequisites || [];
    const hasMeta = prereqs.some(isMetaAllPrevSemesters);

    // meta: si pide "semestres anteriores", validar todos los previos al semestre del ramo
    if (hasMeta && !hasApprovedUpToSemester(subject.semester - 1, completedSubjects)) {
      return false;
    }

    // chequear solo prerrequisitos reales por igualdad estricta
    const realPrereqs = prereqs.filter(pr => !isMetaAllPrevSemesters(pr));
    if (realPrereqs.length === 0) return true;

    const completedNorm = new Set(Array.from(completedSubjects).map(norm));
    return realPrereqs.every(pr => completedNorm.has(norm(pr)));
  };

  const handleSubjectClick = (subject: Subject) => setSelectedSubject(subject);
  const handleCloseModal = () => setSelectedSubject(null);

  // cascada al desmarcar, incluyendo la meta regla del capstone
  const removeDependentSubjects = (toRemove: Set<string>, completed: Set<string>) => {
    let changed = true;
    while (changed) {
      changed = false;

      // regla global 1..3 para electivos y emprendimiento
      if (!hasApprovedUpToSemester(3, completed)) {
        for (const s of getAllSubjects()) {
          if ((isProfessionalElective(s) || isEmprendimiento(s)) && completed.has(s.name)) {
            completed.delete(s.name);
            toRemove.add(s.name);
            changed = true;
          }
        }
      }

      // dependencias explicitas exactas
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        const prereqs = (s.prerequisites || []).filter(pr => !isMetaAllPrevSemesters(pr));
        const ok = prereqs.every(pr => Array.from(completed).some(done => eq(done, pr)));
        if (!ok) {
          completed.delete(s.name);
          toRemove.add(s.name);
          changed = true;
        }
      }

      // meta: si pierde algun ramo previo, capstone y similares caen
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        const hasMeta = (s.prerequisites || []).some(isMetaAllPrevSemesters);
        if (hasMeta && !hasApprovedUpToSemester(s.semester - 1, completed)) {
          completed.delete(s.name);
          toRemove.add(s.name);
          changed = true;
        }
      }

      // verificacion final general
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        const prereqs = s.prerequisites || [];
        const hasMeta = prereqs.some(isMetaAllPrevSemesters);
        const realPrereqs = prereqs.filter(pr => !isMetaAllPrevSemesters(pr));
        const completedNorm = new Set(Array.from(completed).map(norm));
        const ok =
          (!requiresFirstThreeCompleted(s) || hasApprovedUpToSemester(3, completed)) &&
          (!hasMeta || hasApprovedUpToSemester(s.semester - 1, completed)) &&
          realPrereqs.every(pr => completedNorm.has(norm(pr)));
        if (!ok) {
          completed.delete(s.name);
          toRemove.add(s.name);
          changed = true;
        }
      }
    }
  };

  const handleSubjectToggle = (subjectName: string) => {
    setCompletedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectName)) {
        // desmarcar -> cascada
        next.delete(subjectName);
        const toRemove = new Set<string>([subjectName]);
        removeDependentSubjects(toRemove, next);
      } else {
        // marcar -> solo si esta disponible
        const subj = getAllSubjects().find(s => s.name === subjectName);
        if (!subj || !isSubjectAvailable(subj)) return next;
        next.add(subjectName);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* header responsive para movil */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* en movil se apila; en sm+ se usa grilla: logo - titulo - escudo */}
          <div className="flex flex-col items-center gap-3 sm:grid sm:grid-cols-[auto,1fr,auto] sm:items-center">
            {/* logo izq */}
            <img
              src="/DISC.2HD.png"
              alt="logo disc"
              className="h-10 w-auto sm:h-16 justify-self-start"
            />

            {/* titulo adaptativo */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-800 leading-tight text-center">
              Seguimiento de Progreso Curricular UCN
            </h1>

            {/* escudo der oculto en movil para evitar solapado */}
            <img
              src="/Escudo-UCN-Full.png"
              alt="escudo ucn"
              className="hidden sm:block h-14 w-auto justify-self-end"
            />

            {/* fila extra visible en movil: escudo + boton a todo el ancho */}
            <div className="w-full sm:w-auto sm:col-span-3 flex items-center justify-center gap-3">
              <img
                src="/Escudo-UCN-Full.png"
                alt="escudo ucn"
                className="h-10 w-auto sm:hidden"
              />
              <button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                onClick={() => {
                  const total = getAllSubjects().length;
                  const completadas = Array.from(completedSubjects);
                  const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);

                  const materias = completadas.map(name => {
                    const subject = getAllSubjects().find(s => s.name === name);
                    return {
                      nombre: name,
                      prerrequisitos: subject?.prerequisites || [],
                      disponible: subject ? (isSubjectAvailable(subject) ? 'Si' : 'No') : 'No'
                    };
                  });

                  const doc = new jsPDF();
                  doc.setFontSize(18);
                  doc.text('Seguimiento de Progreso Curricular UCN', 14, 18);

                  doc.setFontSize(12);
                  doc.text('Resumen:', 14, 30);
                  doc.text(`Total de materias: ${total}`, 14, 38);
                  doc.text(`Completadas: ${completadas.length}`, 14, 44);
                  doc.text(`Porcentaje: ${porcentaje}%`, 14, 50);
                  doc.text('Materias completadas:', 14, 62);

                  let y = 70;
                  materias.forEach((m, i) => {
                    doc.text(
                      `${i + 1}. ${m.nombre} | Prerrequisitos: ${m.prerrequisitos.join(', ') || 'Ninguno'} | Disponible: ${m.disponible}`,
                      14,
                      y
                    );
                    y += 8;
                    if (y > 270) {
                      doc.addPage();
                      y = 20;
                    }
                  });

                  doc.save('progreso_curricular_ucn.pdf');
                }}
              >
                Descargar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressSummary
          completedSubjects={completedSubjects}
          totalSubjects={getAllSubjects().length}
        />

        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {Object.values(curriculumData).map(semester => {
          const disponibles = semester.subjects.filter(isSubjectAvailable);
          const allSelected = disponibles.length > 0 && disponibles.every(s => completedSubjects.has(s.name));

          return (
            <div key={semester.number} className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Semestre {semester.number}</h2>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow text-sm"
                  onClick={() => {
                    setCompletedSubjects(prev => {
                      const next = new Set(prev);
                      const todas = disponibles.every(s => next.has(s.name));
                      if (todas) {
                        // desmarcar disponibles del semestre + cascada
                        const toRemove = new Set<string>(disponibles.map(s => s.name));
                        disponibles.forEach(s => next.delete(s.name));
                        removeDependentSubjects(toRemove, next);
                      } else {
                        // marcar solo disponibles del semestre
                        disponibles.forEach(s => next.add(s.name));
                      }
                      return new Set(next);
                    });
                  }}
                >
                  {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
              </div>

              <SubjectGrid
                subjects={semester.subjects}
                completedSubjects={completedSubjects}
                onSubjectClick={(s) => handleSubjectClick(s)}
                onSubjectToggle={(name) => handleSubjectToggle(name)}
                isSubjectAvailable={isSubjectAvailable}
                searchTerm={searchTerm}
              />
            </div>
          );
        })}
      </div>

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          isCompleted={completedSubjects.has(selectedSubject.name)}
          isAvailable={isSubjectAvailable(selectedSubject)}
          onToggleComplete={() => handleSubjectToggle(selectedSubject.name)}
          onClose={handleCloseModal}
        />
      )}

      <footer className="mt-16 mb-6 flex flex-col items-center text-slate-600">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📧</span>
          <span className="text-lg font-semibold">jean.garnica@alumnos.ucn.cl</span>
        </div>
        <div className="mt-2 text-base text-center font-medium">
          Ingeniería en Computación e Informática - Universidad Católica del Norte
        </div>
      </footer>
    </div>
  );
}

export default App;
