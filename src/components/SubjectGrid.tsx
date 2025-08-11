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
    const done = completedSubjects.has(subject.name);
    const available = isSubjectAvailable(subject);

    if (done) {
      return {
        status: 'completed' as const,
        classes: 'bg-green-100 border-green-300 text-green-800 opacity-90',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    } else if (available) {
      return {
        status: 'available' as const,
        classes: `${getSemesterColorClasses(subject.semester)} hover:shadow-lg transform hover:scale-105 cursor-pointer`,
        icon: Circle,
        iconColor: 'text-blue-500'
      };
    } else {
      return {
        status: 'locked' as const,
        classes: 'bg-gray-100 border-gray-300 text-gray-500 opacity-60',
        icon: Lock,
        iconColor: 'text-gray-400'
      };
    }
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark>
        : part
    );
  };

  const handleSubjectClick = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    onSubjectClick(subject);
  };

  const handleToggleClick = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    if (!isSubjectAvailable(subject)) return; // respeta bloqueo
    onSubjectToggle(subject.name);
  };

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-lg text-slate-600">No se encontraron materias</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject, index) => {
        const status = getSubjectStatus(subject);
        const StatusIcon = status.icon;

        return (
          <div
            key={`${subject.name}-${index}`}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${status.classes}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-2 leading-tight">
                  {highlightSearchTerm(subject.name, searchTerm)}
                </h3>

                {subject.prerequisites.length > 0 && (
                  <div className="flex items-center text-sm opacity-75 mb-2">
                    <Link className="h-3 w-3 mr-1" />
                    <span>
                      {subject.prerequisites.length} prerrequisito
                      {subject.prerequisites.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => handleToggleClick(e, subject)}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors disabled:opacity-40"
                disabled={status.status === 'locked'}
                title={
                  status.status === 'locked'
                    ? 'Bloqueada por prerrequisitos'
                    : status.status === 'completed'
                    ? 'Desmarcar'
                    : 'Marcar como completada'
                }
              >
                <StatusIcon className={`h-5 w-5 ${status.iconColor}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs opacity-75">
                {status.status === 'completed' && 'Completada'}
                {status.status === 'available' && 'Disponible'}
                {status.status === 'locked' && 'Bloqueada'}
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
  );
};

export default SubjectGrid;
