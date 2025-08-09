import React, { useState } from 'react';
import jsPDF from "jspdf";
import SubjectGrid from './components/SubjectGrid';
import SubjectModal from './components/SubjectModal';
import SearchBar from './components/SearchBar';
import ProgressSummary from './components/ProgressSummary';
import { curriculumData } from './data/curriculumData';
import { Subject } from './types';

function App() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleCloseModal = () => {
    setSelectedSubject(null);
  };

  const handleSubjectToggle = (subjectName: string) => {
    const newCompleted = new Set(completedSubjects);
    if (newCompleted.has(subjectName)) {
      newCompleted.delete(subjectName);
    } else {
      newCompleted.add(subjectName);
    }
    setCompletedSubjects(newCompleted);
  };

  const isSubjectAvailable = (subject: Subject): boolean => {
    if (subject.prerequisites.length === 0) return true;
    return subject.prerequisites.every(prereq => completedSubjects.has(prereq));
  };

  const getAllSubjects = (): Subject[] => {
    return Object.values(curriculumData).flatMap(semester => semester.subjects);
  };

  // Filter subjects based on search term across all semesters
  const getFilteredSubjects = () => {
    const allSubjects = getAllSubjects();
    
    if (!searchTerm) return allSubjects;
    
    return allSubjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSubjects = getFilteredSubjects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center relative">
          {/* Logo DISC.2HD al lado de la S de Seguimiento */}
          <img
            src="/DISC.2HD.png"
            alt="Logo DISC"
            className="h-16 w-auto mr-3"
            style={{ maxHeight: 64 }}
          />
          <h1 className="text-4xl font-extrabold text-slate-800 text-center flex items-center">
            Seguimiento de Progreso Curricular&nbsp;UCN
            <img
              src="/Escudo-UCN-Full.png"
              alt="Escudo UCN"
              className="h-14 w-auto ml-3 align-middle"
              style={{ maxHeight: 56 }}
            />
          </h1>
          {/* Botón Descargar */}
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
                  disponible: isSubjectAvailable(subject!) ? "Sí" : "No"
                };
              });

              // Crear PDF
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
              materias.forEach((mat, idx) => {
                doc.text(
                  `${idx + 1}. ${mat.nombre} | Prerrequisitos: ${mat.prerequisitos.join(", ") || "Ninguno"} | Disponible: ${mat.disponible}`,
                  14,
                  y
                );
                y += 8;
                if (y > 270) {
                  doc.addPage();
                  y = 20;
                }
              });

              doc.save("progreso_curricular_ucn.pdf");
            }}
          >
            Descargar
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary */}
        <ProgressSummary 
          completedSubjects={completedSubjects}
          totalSubjects={getAllSubjects().length}
        />

        {/* Search Bar */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Main Content */}
        <div className="mt-8 space-y-6">
          {searchTerm && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-800">
                Resultados de búsqueda para "{searchTerm}"
              </h2>
              <p className="text-slate-600">
                {filteredSubjects.length} materias encontradas
              </p>
            </div>
          )}

          <SubjectGrid
            subjects={filteredSubjects}
            completedSubjects={completedSubjects}
            onSubjectClick={handleSubjectClick}
            onSubjectToggle={handleSubjectToggle}
            isSubjectAvailable={isSubjectAvailable}
            searchTerm={searchTerm}
          />
        </div>
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

      {/* Footer personalizado */}
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