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
      { name: 'Inglés I', prerequisites: [], semester: 1 }, // Agregado aquí
      { name: 'Formación General Valórica I', prerequisites: [], semester: 1 },
      { name: 'Proyecto Introducción a la Ingeniería', prerequisites: [], semester: 1 }
      // { name: 'Formación General Globalización', prerequisites: [], semester: 1 }, // Eliminado según indicación
    ]
  },
  2: {
    number: 2,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    subjects: [
      { name: 'Física I', prerequisites: ['Cálculo I'], semester: 2 },
      { name: 'Cálculo II', prerequisites: ['Cálculo I'], semester: 2 },
      { name: 'Álgebra II', prerequisites: ['Álgebra I'], semester: 2 },
      { name: 'Programación', prerequisites: [], semester: 2 },
      { name: 'Formación General Valórica II', prerequisites: ['Formación General Valórica I'], semester: 2 }, // Corregido aquí
      { name: 'Inglés II', prerequisites: ['Inglés I'], semester: 2 }
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
      { name: 'Arquitectura de Computadores', prerequisites: ['Álgebra II'], semester: 3 },
      { name: 'Programación Avanzada', prerequisites: ['Programación'], semester: 3 },
      { name: 'Proyecto de Arquitectura de Computadores', prerequisites: ['Programación'], semester: 3 }, // Corregido aquí
      { name: 'Formación General Comunicacional II', prerequisites: [], semester: 3 }
    ]
  },
  4: {
    number: 4,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    subjects: [
      { name: 'Electrotecnia', prerequisites: ['Física II'], semester: 4 },
      { 
        name: 'Sistemas Operativos', 
        prerequisites: ['Proyecto de Arquitectura de Computadores', 'Arquitectura de Computadores'],
        semester: 4 
      },
      { name: 'Redes de Computadores', prerequisites: ['Sistemas Operativos'], semester: 4 },
      { name: 'Estructura de Datos', prerequisites: ['Programación Avanzada'], semester: 4 },
      { name: 'Formación General Valórica III', prerequisites: [], semester: 4 },
      { name: 'Proyecto Programación Avanzada', prerequisites: ['Programación Avanzada'], semester: 4 } // Corregido aquí
    ]
  },
  5: {
    number: 5,
    color: 'pink',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    subjects: [
      { name: 'Ingeniería Económica', prerequisites: ['Cálculo II'], semester: 5 }, // Corregido aquí
      { name: 'Electivo Profesional I', prerequisites: [], semester: 5 },
      { name: 'Base de Datos', prerequisites: ['Estructura de Datos'], semester: 5 },
      { name: 'Diseño de Redes Empresariales', prerequisites: ['Redes de Computadores'], semester: 5 },
      { name: 'Ingeniería de Software', prerequisites: ['Estructura de Datos'], semester: 5 },
      { 
        name: 'Proyecto Administración Middleware', 
        prerequisites: ['Sistemas Operativos', 'Redes de Computadores'],
        semester: 5 
      }
    ]
  },
  6: {
    number: 6,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    subjects: [
      { name: 'Electivo Profesional II', prerequisites: [], semester: 6 },
      { name: 'Diseño, Ingeniería e Innovación', prerequisites: ['Proyecto Introducción a la Ingeniería'], semester: 6 },
      { name: 'Sistemas de Información', prerequisites: ['Redes de Computadores', 'Base de Datos'], semester: 6 },
      { name: 'Desarrollo de Soluciones Móviles', prerequisites: ['Ingeniería de Software'], semester: 6 },
      { name: 'Emprendimiento', prerequisites: [], semester: 6 },
      { name: 'Ética y Moral Profesional', prerequisites: ['Formación General Valórica III'], semester: 6 },
      { 
        name: 'Proyecto Redes de Computadores', 
        prerequisites: ['Diseño de Redes Empresariales', 'Proyecto Administración Middleware'], // Corregido aquí
        semester: 6 
      },
      { 
        name: 'Práctica Pre Profesional', 
        prerequisites: ['Proyecto Administración Middleware', 'Base de Datos', 'Ingeniería de Software'], // Corregido aquí
        semester: 6 
      }
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
      { 
        name: 'Internet de las Cosas', 
        prerequisites: ['Electrotecnia', 'Diseño, Ingeniería e Innovación', 'Programación'], // Corregido aquí
        semester: 7 
      },
      { name: 'Seguridad TI', prerequisites: ['Diseño de Redes Empresariales'], semester: 7 },
      { name: 'TIC en Procesos Industriales', prerequisites: ['Electrotecnia'], semester: 7 },
      { 
        name: 'Proyecto Desarrollo e Integración de Soluciones', 
        prerequisites: ['Desarrollo de Soluciones Móviles'], // Corregido aquí
        semester: 7 
      }
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