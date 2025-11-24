import AuthForm from '@/components/AuthForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}

