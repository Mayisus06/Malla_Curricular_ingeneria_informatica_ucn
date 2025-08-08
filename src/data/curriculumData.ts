import { Semester } from '../types';

export const curriculumData: Record<number, Semester> = {
  1: {
    number: 1,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    subjects: [
      { name: 'Cálculo I', prerequisites: [], semester: 1 },
      { name: 'Álgebra I', prerequisites: [], semester: 1 },
      { name: 'Química General', prerequisites: [], semester: 1 },
      { name: 'Formación General Comunicacional I', prerequisites: [], semester: 1 },
      { name: 'Formación General Globalización', prerequisites: [], semester: 1 },
      { name: 'Formación General Valórica I', prerequisites: [], semester: 1 },
      { name: 'Proyecto Introducción a la Ingeniería', prerequisites: [], semester: 1 }
    ]
  },
  2: {
    number: 2,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    subjects: [
      { name: 'Física I', prerequisites: [], semester: 2 },
      { name: 'Cálculo II', prerequisites: ['Cálculo I'], semester: 2 },
      { name: 'Álgebra II', prerequisites: ['Álgebra I'], semester: 2 },
      { name: 'Programación', prerequisites: ['Álgebra I'], semester: 2 },
      { name: 'Formación General Valórica II', prerequisites: [], semester: 2 },
      { name: 'Formación General Globalización', prerequisites: [], semester: 2 }
    ]
  },
  3: {
    number: 3,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    subjects: [
      { name: 'Física II', prerequisites: ['Física I'], semester: 3 },
      { name: 'Estadística', prerequisites: ['Cálculo II'], semester: 3 },
      { name: 'Arquitectura de Computadores', prerequisites: [], semester: 3 },
      { name: 'Programación Avanzada', prerequisites: ['Programación'], semester: 3 },
      { name: 'Proyecto de Arquitectura de Computadores', prerequisites: ['Arquitectura de Computadores'], semester: 3 },
      { name: 'Formación General Comunicacional II', prerequisites: [], semester: 3 }
    ]
  },
  4: {
    number: 4,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    subjects: [
      { name: 'Electrotecnia', prerequisites: [], semester: 4 },
      { name: 'Sistemas Operativos', prerequisites: ['Programación'], semester: 4 },
      { name: 'Redes de Computadores', prerequisites: ['Sistemas Operativos'], semester: 4 },
      { name: 'Estructura de Datos', prerequisites: ['Programación Avanzada'], semester: 4 },
      { name: 'Formación General Valórica III', prerequisites: [], semester: 4 },
      { name: 'Formación General Electiva', prerequisites: [], semester: 4 },
      { name: 'Proyecto Programación Avanzada', prerequisites: ['Programación'], semester: 4 }
    ]
  },
  5: {
    number: 5,
    color: 'pink',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    subjects: [
      { name: 'Ingeniería Económica', prerequisites: [], semester: 5 },
      { name: 'Electivo Profesional I', prerequisites: [], semester: 5 },
      { name: 'Base de Datos', prerequisites: ['Programación'], semester: 5 },
      { name: 'Diseño de Redes Empresariales', prerequisites: ['Redes de Computadores'], semester: 5 },
      { name: 'Ingeniería de Software', prerequisites: ['Estructura de Datos'], semester: 5 },
      { name: 'Proyecto Administración Middleware', prerequisites: ['Base de Datos'], semester: 5 }
    ]
  },
  6: {
    number: 6,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    subjects: [
      { name: 'Electivo Profesional II', prerequisites: [], semester: 6 },
      { name: 'Diseño, Ingeniería e Innovación', prerequisites: [], semester: 6 },
      { name: 'Sistemas de Información', prerequisites: ['Base de Datos'], semester: 6 },
      { name: 'Desarrollo de Soluciones Móviles', prerequisites: ['Programación Avanzada'], semester: 6 },
      { name: 'Emprendimiento', prerequisites: [], semester: 6 },
      { name: 'Ética y Moral Profesional', prerequisites: [], semester: 6 },
      { name: 'Proyecto Redes de Computadores', prerequisites: ['Diseño de Redes Empresariales'], semester: 6 },
      { name: 'Práctica Pre Profesional', prerequisites: ['créditos mínimos aprobados'], semester: 6 }
    ]
  },
  7: {
    number: 7,
    color: 'teal',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    subjects: [
      { name: 'Electivo Profesional III', prerequisites: [], semester: 7 },
      { name: 'Electivo Profesional IV', prerequisites: [], semester: 7 },
      { name: 'Internet de las Cosas', prerequisites: ['Redes de Computadores'], semester: 7 },
      { name: 'Seguridad TI', prerequisites: ['Redes de Computadores'], semester: 7 },
      { name: 'TIC en Procesos Industriales', prerequisites: [], semester: 7 },
      { name: 'Proyecto Desarrollo e Integración de Soluciones', prerequisites: ['Ingeniería de Software'], semester: 7 }
    ]
  },
  8: {
    number: 8,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    subjects: [
      { name: 'Capstone Project', prerequisites: ['haber completado todos los semestres anteriores'], semester: 8 }
    ]
  }
};