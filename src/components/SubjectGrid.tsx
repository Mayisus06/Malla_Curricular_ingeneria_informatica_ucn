import React from 'react';
import { Subject } from '../types';
import { BookOpen, Link, CheckCircle, Circle, Lock } from 'lucide-react';

interface SubjectGridProps {
  subjects: Subject[];
  completedSubjects: Set<string>;
  onSubjectClick: (subject: Subject) => void;
  onSubjectToggle: (subjectName: string) => void;
  isSubjectAvailable: (subject: Subject) => boolean;
  searchTerm?: string;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ 
  subjects, 
  completedSubjects,
  onSubjectClick,
  onSubjectToggle,
  isSubjectAvailable,
  searchTerm = ''
}) => {
  const getSemesterColorClasses = (semester: number) => {
    const colors = {
      1: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      2: 'bg-blue-50 border-blue-200 text-blue-800',
      3: 'bg-orange-50 border-orange-200 text-orange-800',
      4: 'bg-purple-50 border-purple-200 text-purple-800',
      5: 'bg-pink-50 border-pink-200 text-pink-800',
      6: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      7: 'bg-teal-50 border-teal-200 text-teal-800',
      8: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[semester as keyof typeof colors] || 'bg-slate-50 border-slate-200 text-slate-800';
  };

  const getSubjectStatus = (subject: Subject) => {
    const isCompleted = completedSubjects.has(subject.name);
    const isAvailable = isSubjectAvailable(subject);
    
    if (isCompleted) {
      return {
        status: 'completed',
        classes: 'bg-green-100 border-green-300 text-green-800 opacity-90',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    } else if (isAvailable) {
      return {
        status: 'available',
        classes: `${getSemesterColorClasses(subject.semester)} hover:shadow-lg transform hover:scale-105 cursor-pointer`,
        icon: Circle,
        iconColor: 'text-blue-500'
      };
    } else {
      return {
        status: 'locked',
        classes: 'bg-gray-100 border-gray-300 text-gray-500 opacity-60',
        icon: Lock,
        iconColor: 'text-gray-400'
      };
    }
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    ));
  };

  const handleSubjectClick = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    onSubjectClick(subject);
  };

  const handleToggleClick = (e: React.MouseEvent, subjectName: string) => {
    e.stopPropagation();
    onSubjectToggle(subjectName);
  };

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-lg text-slate-600">No se encontraron materias</p>
      </div>
    );
  }

  // Group subjects by semester for better organization
  const subjectsBySemester = subjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) {
      acc[subject.semester] = [];
    }
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  return (
    <div className="space-y-8">
      {Object.entries(subjectsBySemester)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([semester, semesterSubjects]) => (
          <div key={semester} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Semestre {semester}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {semesterSubjects.map((subject, index) => {
                const subjectStatus = getSubjectStatus(subject);
                const StatusIcon = subjectStatus.icon;
                
                return (
                  <div
                    key={`${subject.name}-${index}`}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${subjectStatus.classes}
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2 leading-tight">
                          {highlightSearchTerm(subject.name, searchTerm)}
                        </h3>
                        
                        {subject.prerequisites.length > 0 && (
                          <div className="flex items-center text-sm opacity-75 mb-2">
                            <Link className="h-3 w-3 mr-1" />
                            <span>{subject.prerequisites.length} prerrequisito{subject.prerequisites.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleToggleClick(e, subject.name)}
                          className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
                          disabled={subjectStatus.status === 'locked'}
                        >
                          <StatusIcon className={`h-5 w-5 ${subjectStatus.iconColor}`} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs opacity-75">
                        {subjectStatus.status === 'completed' && 'Completada'}
                        {subjectStatus.status === 'available' && 'Disponible'}
                        {subjectStatus.status === 'locked' && 'Bloqueada'}
                      </div>
                      <button
                        onClick={(e) => handleSubjectClick(e, subject)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default SubjectGrid;