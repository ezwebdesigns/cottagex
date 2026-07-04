import { redirect } from 'next/navigation';

export default function TermsRedirect({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/p/terms`);
}
