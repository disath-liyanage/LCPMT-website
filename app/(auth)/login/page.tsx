import { login } from './actions'
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-background p-8 shadow-lg border border-border">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-center">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to manage projects
          </p>
        </div>
        
        <form className="space-y-6" action={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}