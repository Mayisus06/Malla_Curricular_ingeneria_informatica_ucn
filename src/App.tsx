// App.tsx
import React, { useMemo, useState } from 'react';
import jsPDF from "jspdf";
import SubjectGrid from './components/SubjectGrid';
import SubjectModal from './components/SubjectModal';
import SearchBar from './components/SearchBar';
import ProgressSummary from './components/ProgressSummary';
// import { curriculumData } from './data/curriculumData';
import { curriculumData as baseCurriculumData } from './data/curriculumData';
import { Subject } from './types';

function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());

  // normalizar: sin acentos, colapsar espacios, minúsculas
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  // parche runtime: F.G. Comunicacional II requiere F.G. Comunicacional I
  const curriculumData = useMemo(() => {
    const clone = JSON.parse(JSON.stringify(baseCurriculumData)) as typeof baseCurriculumData;
    Object.values(clone).forEach(sem => {
      sem.subjects = sem.subjects.map(s =>
        s.name === 'Formación General Comunicacional II'
          ? { ...s, prerequisites: ['Formación General Comunicacional I'] }
          : s
      );
    });
    return clone;
  }, []);

  // util
  const getAllSubjects = (): Subject[] =>
    Object.values(curriculumData).flatMap(s => s.subjects);

  // disponible solo si TODOS sus prerrequisitos están completados (comparación normalizada)
  const isSubjectAvailable = (subject: Subject): boolean => {
    if (!subject.prerequisites || subject.prerequisites.length === 0) return true;
    const completedNorm = new Set(Array.from(completedSubjects).map(norm));
    return subject.prerequisites.every(pr => completedNorm.has(norm(pr)));
  };

  const handleSubjectClick = (subject: Subject) => setSelectedSubject(subject);
  const handleCloseModal = () => setSelectedSubject(null);

  // eliminar dependientes en cascada (recursivo, a través de todo el plan)
  const removeDependentSubjects = (toRemove: Set<string>, completed: Set<string>) => {
    let changed = false;
    const toRemoveNorm = new Set(Array.from(toRemove).map(norm));

    for (const s of getAllSubjects()) {
      if (!completed.has(s.name)) continue;
      const dependsOnRemoved = (s.prerequisites || []).some(pr => toRemoveNorm.has(norm(pr)));
      if (dependsOnRemoved) {
        completed.delete(s.name);
        toRemove.add(s.name);
        toRemoveNorm.add(norm(s.name));
        changed = true;
      }
    }
    if (changed) removeDependentSubjects(toRemove, completed);
  };

  // toggle individual con reglas de disponibilidad y cascada al desmarcar
  const handleSubjectToggle = (subjectName: string) => {
    setCompletedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectName)) {
        // desmarcando -> quita dependientes
        next.delete(subjectName);
        const toRemove = new Set<string>([subjectName]);
        removeDependentSubjects(toRemove, next);
      } else {
        // marcando -> solo si está disponible
        const subj = getAllSubjects().find(s => s.name === subjectName);
        if (!subj || !isSubjectAvailable(subj)) return next;
        next.add(subjectName);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center relative">
          <img src="/DISC.2HD.png" alt="Logo DISC" className="h-16 w-auto mr-3" style={{ maxHeight: 64 }} />
          <h1 className="text-4xl font-extrabold text-slate-800 text-center flex items-center">
            Seguimiento de Progreso Curricular&nbsp;UCN
            <img src="/Escudo-UCN-Full.png" alt="Escudo UCN" className="h-14 w-auto ml-3 align-middle" style={{ maxHeight: 56 }} />
          </h1>

          {/* Descargar PDF */}
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
                  disponible: subject ? (isSubjectAvailable(subject) ? "Sí" : "No") : "No"
                };
              });

              const doc = new jsPDF();
              doc.setFontSize(18);
              doc.text("Seguimiento de Progreso Curricular UCN", 14, 18);

              doc.setFontSize(12);
              doc.text("Resumen:", 14, 30);
              doc.text(`Total de materias: ${total}`, 14, 38);
              doc.text(`Completadas: ${completadas.length}`, 14, 44);
              doc.text(`Porcentaje: ${porcentaje}%`, 14, 50);
              doc.text("Materias completadas:", 14, 62);

              let y = 70;
              materias.forEach((m, i) => {
                doc.text(`${i + 1}. ${m.nombre} | Prerrequisitos: ${m.prerequisitos.join(", ") || "Ninguno"} | Disponible: ${m.disponible}`, 14, y);
                y += 8;
                if (y > 270) { doc.addPage(); y = 20; }
              });

              doc.save("progreso_curricular_ucn.pdf");
            }}
          >
            Descargar
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen */}
        <ProgressSummary 
          completedSubjects={completedSubjects}
          totalSubjects={getAllSubjects().length}
        />

        {/* Búsqueda */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Por semestre */}
        {Object.values(curriculumData).map(semester => {
          const disponibles = semester.subjects.filter(isSubjectAvailable);
          const allSelected = disponibles.length > 0 && disponibles.every(s => completedSubjects.has(s.name));

          return (
            <div key={semester.number} className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              {/* Título + botón */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Semestre {semester.number}</h2>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow text-sm"
                  onClick={() => {
                    setCompletedSubjects(prev => {
                      const next = new Set(prev);
                      const todas = disponibles.every(s => next.has(s.name));
                      if (todas) {
                        // desmarcar disponibles del semestre + cascada global
                        const toRemove = new Set<string>(disponibles.map(s => s.name));
                        disponibles.forEach(s => next.delete(s.name));
                        removeDependentSubjects(toRemove, next);
                      } else {
                        // marcar solo las disponibles del semestre
                        disponibles.forEach(s => next.add(s.name));
                      }
                      return new Set(next);
                    });
                  }}
                >
                  {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
              </div>

              {/* Grid de ramos */}
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

      {/* Modal */}
      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          isCompleted={completedSubjects.has(selectedSubject.name)}
          isAvailable={isSubjectAvailable(selectedSubject)}
          onToggleComplete={() => handleSubjectToggle(selectedSubject.name)}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
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
