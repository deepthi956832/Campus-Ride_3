import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Eye, EyeOff, ChevronLeft, GraduationCap, Briefcase } from 'lucide-react';
import { UserType } from '../types';

export default function RegisterScreen() {
  const { register, navigate } = useAppStore();
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '',
    userType: '' as UserType | '', institution: '',
    department: '', idNumber: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError('');
    const mandatory = ['fullName', 'email', 'userType', 'institution', 'department', 'idNumber'];
    const missing = mandatory.some(k => !form[k as keyof typeof form]);
    
    if (missing) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { success, error: backendError } = await register({
        full_name: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        user_type: form.userType as UserType,
        institution: form.institution,
        department: form.department,
        id_number: form.idNumber,
      });
      if (success) {
        navigate('otp-verify', form.email);
      } else {
        setError(backendError || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-16 pb-20 relative overflow-hidden shrink-0">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <button onClick={() => navigate('login')} className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white mb-6 active:scale-90 transition">
          <ChevronLeft size={22} />
        </button>
        <div className="relative">
          <h1 className="text-3xl font-black text-white tracking-tighter">Create Account</h1>
          <p className="text-white/70 text-sm font-medium mt-1">Join the campus community today</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => update('fullName', e.target.value)}
              placeholder="Your full name"
              className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="your@email.com"
              className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile Number</label>
            <input
              type="tel"
              value={form.mobile}
              onChange={e => update('mobile', e.target.value)}
              placeholder="10-digit mobile number"
              className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password *</label>
            <div className="relative mt-1">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">I am a... *</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => update('userType', 'student')}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition ${
                  form.userType === 'student'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  form.userType === 'student' ? 'bg-indigo-500' : 'bg-gray-200'
                }`}>
                  <GraduationCap size={20} className={form.userType === 'student' ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className={`text-sm font-semibold ${form.userType === 'student' ? 'text-indigo-600' : 'text-gray-500'}`}>
                  Student
                </span>
              </button>
              <button
                onClick={() => update('userType', 'employee')}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition ${
                  form.userType === 'employee'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  form.userType === 'employee' ? 'bg-purple-500' : 'bg-gray-200'
                }`}>
                  <Briefcase size={20} className={form.userType === 'employee' ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className={`text-sm font-semibold ${form.userType === 'employee' ? 'text-purple-600' : 'text-gray-500'}`}>
                  Employee
                </span>
              </button>
            </div>
          </div>

          {form.userType && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {form.userType === 'student' ? 'College / Institution *' : 'Company / Organization *'}
                </label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={e => update('institution', e.target.value)}
                  placeholder={form.userType === 'student' ? 'e.g. ABC Engineering College' : 'e.g. XYZ Tech Solutions'}
                  className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department *</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => update('department', e.target.value)}
                    placeholder="e.g. CSE"
                    className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID Number *</label>
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={e => update('idNumber', e.target.value)}
                    placeholder="e.g. 21CS001"
                    className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !form.fullName || !form.email || !form.password || !form.userType || !form.institution || !form.department || !form.idNumber}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition disabled:opacity-50 disabled:grayscale"
          >
            {loading ? 'Requesting OTP...' : 'Get Verification Code 🚀'}
          </button>

          <div className="text-center">
            <p className="text-gray-500 text-sm">Already have an account?{' '}
              <button onClick={() => navigate('login')} className="text-indigo-600 font-semibold">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
