import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '@bbook/app/features/home/screen'

export const Route = createFileRoute('/second')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HomeScreen />
}
