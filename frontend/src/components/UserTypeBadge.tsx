import { GraduationCap, Briefcase } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  variant?: 'light' | 'colored';
  className?: string;
}

export default function UserTypeBadge({ user, variant = 'colored', className = '' }: Props) {
  const isStudent = user.user_type === 'student';
  const label = isStudent ? 'Student' : 'Employee';
  const subLabel = user.institution;

  if (variant === 'light') {
    return (
      <div className={`flex flex-col items-start ${className}`}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur">
          {isStudent ? <GraduationCap size={12} className="text-white" /> : <Briefcase size={12} className="text-white" />}
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        {subLabel && <span className="text-white/70 text-[10px] mt-1 ml-1 truncate max-w-[180px]">{subLabel}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
        isStudent ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
      }`}>
        {isStudent ? <GraduationCap size={12} /> : <Briefcase size={12} />}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {subLabel && <span className="text-gray-400 text-[10px] mt-1 ml-1 truncate max-w-[180px] font-medium">{subLabel}</span>}
    </div>
  );
}
