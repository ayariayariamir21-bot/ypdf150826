import { redirect } from 'next/navigation';

export default function RootPage(): React.ReactElement {
  redirect('/dashboard');
}
