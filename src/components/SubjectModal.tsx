import React from 'react';
import { Subject } from '../types';
import { X, BookOpen, ArrowRight, CheckCircle, Circle, Lock, Info } from 'lucide-react';

interface SubjectModalProps {
  subject: Subject;
  isCompleted: boolean;
  isAvailable: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  subject,
  isCompleted,
  isAvailable,
  onToggleComplete,
  onClose
}) => {
  const getSemesterColor = (semester: number) => {
    const colors = {
      1: 'bg-emerald-500',
      2: 'bg-blue-500',
      3: 'bg-orange-500',
      4: 'bg-purple-500',
      5: 'bg-pink-500',
      6: 'bg-indigo-500',
      7: 'bg-teal-500',
      8: 'bg-red-500'
    };
    return colors[semester as keyof typeof colors] || 'bg-slate-500';
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        icon: CheckCircle,
        text: 'Completada',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else if (isAvailable) {
      return {
        icon: Circle,
        text: 'Disponible para cursar',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    } else {
      return {
        icon: Lock,
        text: 'Bloqueada (faltan prerrequisitos)',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // helpers locales para nota informativa
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const isProfessionalElective = norm(subject.name).includes('electivo profesional');
  const isEmprendimiento = norm(subject.name).includes('emprendimiento');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-slate-600" />
            <h2 className="text-2xl font-bold text-slate-800">Detalles de la Materia</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Subject Name */}
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {subject.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getSemesterColor(subject.semester)}`}
              >
                Semestre {subject.semester}
              </span>
            </div>
          </div>

          {/* Status Section */}
          <div className={`${statusInfo.bgColor} rounded-xl p-4 border ${statusInfo.borderColor} mb-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                <span className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              {(isCompleted || isAvailable) && (
                <button
                  onClick={onToggleComplete}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isCompleted
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
                </button>
              )}
            </div>
          </div>

          {/* Prerrequisitos Section */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              Prerrequisitos
            </h4>

            {subject.prerequisites.length > 0 ? (
              <div className="space-y-3">
                {subject.prerequisites.map((prereq, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-slate-700 font-medium">{prereq}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-slate-600 font-medium">No requiere prerrequisitos</p>
                <p className="text-slate-500 text-sm mt-1">Esta materia se puede cursar sin materias previas</p>
              </div>
            )}

            {/* Nota especial para Electivo Profesional y Emprendimiento */}
            {(isProfessionalElective || isEmprendimiento) && (
              <div className="mt-4 p-4 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <p className="text-amber-800 text-sm">
                  Regla general: <strong>esta materia</strong> se habilita solo cuando
                  tengas aprobados <strong>todos los ramos de Semestres 1, 2 y 3</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Nota:</strong> Marca las materias como completadas para ver qué nuevas materias se desbloquean.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectModal;
