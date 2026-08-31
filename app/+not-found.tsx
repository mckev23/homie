import { Redirect } from 'expo-router';

/*
Anything that doesn't match a real route sends the user to the app root
rather than a dead end. `app/index.tsx` then decides where they actually
belong (welcome screen, or straight into the tabs if they're signed in).

This matters beyond ordinary typos in a URL. hōm is opened through links
we don't fully control — Supabase auth emails, and, while testing, the
EAS Update preview links that Expo Go opens. Those can hand the router a
path that matches nothing, and the default behaviour was to strand the
user on "This screen doesn't exist" with no way back into the app.
A consumer app should never show that screen.
*/
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
