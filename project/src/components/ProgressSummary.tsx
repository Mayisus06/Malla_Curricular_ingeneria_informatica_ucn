import React from 'react';
import { GraduationCap, TrendingUp, CheckCircle } from 'lucide-react';

interface ProgressSummaryProps {
  completedSubjects: Set<string>;
  totalSubjects: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ 
  completedSubjects, 
  totalSubjects 
}) => {
  const completedCount = completedSubjects.size;
  const progressPercentage = totalSubjects > 0 ? (completedCount / totalSubjects) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Progreso Académico</h2>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">{completedCount} de {totalSubjects} materias</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Progreso de la carrera</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Completadas</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-1">{completedCount}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Restantes</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{totalSubjects - completedCount}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <span className="text-purple-800 font-medium">Progreso</span>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">{progressPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {progressPercentage === 100 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-bold text-lg">
              ¡Felicitaciones! Has completado toda la malla curricular
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressSummary;