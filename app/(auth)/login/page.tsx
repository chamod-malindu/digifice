"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (res?.error) {
                toast.error("Invalid credentials")
                setIsLoading(false)
            } else {
                toast.success("Logged in")
                router.refresh()
                // Determine redirect based on role? 
                // For now let middleware or standard redirect handle it.
                // Or manual check?
                // Simple: router.push('/admin') or others?
                // Let's rely on callback or just push to /admin for now as we focused on Admin.
                // Actually best to check session role, but here we just push to a dashboard.
                // Since we don't know the role easily client-side without session hook (which needs provider).
                // Router refresh + push '/' is safest, middleware directs.
                router.push('/admin') // Defaulting to admin for demo flow in chat context.
            }
        } catch (error) {
            toast.error("Something went wrong")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to continue.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" asChild><Link href="/">Back</Link></Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? "..." : "Login"}</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
