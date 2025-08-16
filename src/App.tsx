// App.tsx
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

  // utils de texto
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const normStrong = (s: string) =>
    norm(s)
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const matchName = (a: string, b: string) => {
    const na = normStrong(a);
    const nb = normStrong(b);
    return na === nb || na.includes(nb) || nb.includes(na);
  };

  const hasCompletedPrereqGiven = (pr: string, completed: Set<string>) => {
    for (const done of completed) if (matchName(pr, done)) return true;
    return false;
  };

  // reglas globales
  const isProfessionalElective = (s: Subject) => norm(s.name).includes('electivo profesional');
  const isEmprendimiento = (s: Subject) => norm(s.name).includes('emprendimiento');
  const requiresFirstThreeCompleted = (s: Subject) => isProfessionalElective(s) || isEmprendimiento(s);

  // meta-prerrequisito: texto "haber completado todos los semestres anteriores"
  const isMetaAllPrevSemesters = (txt: string) => normStrong(txt).includes('semestres anteriores');

  // clonar y parchear data sin tocar el json original
  const curriculumData = useMemo(() => {
    const clone = JSON.parse(JSON.stringify(baseCurriculumData)) as typeof baseCurriculumData;

    // prerequisitos corregidos en formaciones generales
    Object.values(clone).forEach(sem => {
      sem.subjects = sem.subjects.map(s => {
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
        return s;
      });
    });

    // no agregamos nada extra al capstone
    return clone;
  }, []);

  const getAllSubjects = (): Subject[] => Object.values(curriculumData).flatMap(s => s.subjects);

  // helper: revisa si todos los ramos hasta cierto semestre estan aprobados (conjunto dado)
  const hasApprovedUpToSemesterGiven = (limit: number, completed: Set<string>) =>
    getAllSubjects().filter(s => s.semester <= limit).every(s => completed.has(s.name));

  // version parametrizada (usa un set arbitrario)
  const isSubjectAvailableGiven = (subject: Subject, completed: Set<string>): boolean => {
    // regla global 1-3 para electivos y emprendimiento
    if (requiresFirstThreeCompleted(subject) && !hasApprovedUpToSemesterGiven(3, completed)) {
      return false;
    }

    const prereqs = subject.prerequisites || [];

    // meta-regla del capstone u otros ramos que lo incluyan por texto
    const needAllPrev = prereqs.some(isMetaAllPrevSemesters);
    if (needAllPrev && !hasApprovedUpToSemesterGiven(subject.semester - 1, completed)) {
      return false;
    }

    // validar solo prerrequisitos reales (excluye la meta-regla)
    const realPrereqs = prereqs.filter(pr => !isMetaAllPrevSemesters(pr));
    if (realPrereqs.length === 0) return true;

    return realPrereqs.every(pr => hasCompletedPrereqGiven(pr, completed));
  };

  // wrapper contra el estado real
  const isSubjectAvailable = (subject: Subject): boolean =>
    isSubjectAvailableGiven(subject, completedSubjects);

  const handleSubjectClick = (subject: Subject) => setSelectedSubject(subject);
  const handleCloseModal = () => setSelectedSubject(null);

  // cascada al desmarcar: quita dependencias por nombre, reglas globales y
  // ademas remueve cualquier ramo que YA NO ESTE DISPONIBLE con el nuevo set.
  const removeDependentSubjects = (toRemove: Set<string>, completed: Set<string>) => {
    let changed = true;
    while (changed) {
      changed = false;
      const toRemoveArr = Array.from(toRemove);

      // 1) dependencias por prerrequisito (match robusto)
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        const dependsOnRemoved = (s.prerequisites || []).some(pr =>
          toRemoveArr.some(r => matchName(pr, r))
        );
        if (dependsOnRemoved) {
          completed.delete(s.name);
          toRemove.add(s.name);
          changed = true;
        }
      }

      // 2) regla global: electivos/emprendimiento requieren 1..3 aprobados
      if (!hasApprovedUpToSemesterGiven(3, completed)) {
        for (const s of getAllSubjects()) {
          if (completed.has(s.name) && requiresFirstThreeCompleted(s)) {
            completed.delete(s.name);
            toRemove.add(s.name);
            changed = true;
          }
        }
      }

      // 3) meta-regla por texto: "semestres anteriores"
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        const needAllPrev = (s.prerequisites || []).some(isMetaAllPrevSemesters);
        if (needAllPrev && !hasApprovedUpToSemesterGiven(s.semester - 1, completed)) {
          completed.delete(s.name);
          toRemove.add(s.name);
          changed = true;
        }
      }

      // 4) verificacion general: si un ramo seleccionado ya NO esta disponible
      // segun las reglas (con el set actualizado), removerlo tambien.
      for (const s of getAllSubjects()) {
        if (!completed.has(s.name)) continue;
        if (!isSubjectAvailableGiven(s, completed)) {
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
        // desmarcando -> cascada total
        next.delete(subjectName);
        const toRemove = new Set<string>([subjectName]);
        removeDependentSubjects(toRemove, next);
      } else {
        // marcando -> solo si esta disponible
        const subj = getAllSubjects().find(s => s.name === subjectName);
        if (!subj || !isSubjectAvailable(subj)) return next;
        next.add(subjectName);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* header */}
      <header className="bg-white shadow-lg border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center relative">
          <img src="/DISC.2HD.png" alt="Logo DISC" className="h-16 w-auto mr-3" style={{ maxHeight: 64 }} />
          <h1 className="text-4xl font-extrabold text-slate-800 text-center flex items-center">
            Seguimiento de Progreso Curricular&nbsp;UCN
            <img src="/Escudo-UCN-Full.png" alt="Escudo UCN" className="h-14 w-auto ml-3 align-middle" style={{ maxHeight: 56 }} />
          </h1>

          {/* boton descargar */}
          <button
            className="ml-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            onClick={() => {
              const total = getAllSubjects().length;
              const completadas = Array.from(completedSubjects);
              const porcentaje = total === 0 ? 0 : Math.round((completadas.length / total) * 100);

              const materias = completadas.map(name => {
                const subject = getAllSubjects().find(s => s.name === name);
                return {
                  nombre: name,
                  prerequisitos: subject?.prerequisites || [],
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
                  `${i + 1}. ${m.nombre} | Prerrequisitos: ${m.prerequisitos.join(', ') || 'Ninguno'} | Disponible: ${m.disponible}`,
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
      </header>

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
                onSubjectClick={handleSubjectClick}
                onSubjectToggle={handleSubjectToggle}
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
