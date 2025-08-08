export interface Subject {
  name: string;
  prerequisites: string[];
  semester: number;
}

export interface Semester {
  number: number;
  subjects: Subject[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export type SemesterColors = 
  | 'emerald' | 'blue' | 'orange' | 'purple' 
  | 'pink' | 'indigo' | 'teal' | 'red' | 'mixed';