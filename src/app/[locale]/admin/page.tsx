import { redirect } from 'next/navigation';

export default function AdminRoot({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/admin/dashboard`);
}
