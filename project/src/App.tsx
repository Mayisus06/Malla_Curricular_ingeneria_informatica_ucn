import React, { useState } from 'react';
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
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-800 text-center">
            Seguimiento de Progreso Curricular
          </h1>
          <p className="text-slate-600 text-center mt-2 text-lg">
            Selecciona las materias completadas y ve cuáles puedes cursar
          </p>
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
    </div>
  );
}

export default App;