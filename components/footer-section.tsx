"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { GitBranch } from "lucide-react"
import Link from "next/link"
import { FOOTER_NAV_LINKS, GITHUB_URL, SITE_NAME } from "@/config/constants"
import { EASE, DUR } from "@/lib/animation"

function StatusBadge() {
	const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
	const [buildTime, setBuildTime] = useState<string | null>(null)

	useEffect(() => {
		fetch("/api/status")
			.then(r => r.json())
			.then(d => {
				setStatus(d.status === "ok" ? "ok" : "error")
				if (d.build_time) {
					const d_ = new Date(d.build_time)
					setBuildTime(d_.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))
				}
			})
			.catch(() => setStatus("error"))
	}, [])

	const color = status === "ok" ? "bg-green-400" : status === "error" ? "bg-red-400" : "bg-yellow-400"
	const label = status === "ok" ? "operational" : status === "error" ? "degraded" : "checking..."

	return (
		<a
			href="/api/status"
			target="_blank"
			rel="noopener noreferrer"
			className="group flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40 transition-colors hover:text-primary/60"
			title={buildTime ? `Built ${buildTime}` : ""}
		>
			<span className="relative flex h-1.5 w-1.5">
				{status === "ok" && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`} />}
				<span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`} />
			</span>
			{label}
			{buildTime && (
				<span className="hidden group-hover:inline text-muted-foreground/30 transition-all">
					· built {buildTime}
				</span>
			)}
		</a>
	)
}

export function FooterSection() {
	const ref = useRef<HTMLElement>(null)
	// Large margin so footer triggers well before it's fully in view
	const isInView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" })

	return (
		<motion.footer
			ref={ref}
			initial={{ opacity: 0, y: 16 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: DUR, ease: EASE }}
			style={{ willChange: "transform, opacity" }}
			className="border-t border-border py-8"
		>
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
				{/* Logo */}
				<Link
					href="/"
					className="font-mono text-sm font-bold text-foreground transition-colors hover:text-primary"
				>
					{"<"}
					<span className="text-primary">RM</span>
					{" />"}
				</Link>

				{/* Nav - plain links, hover handled by CSS transition */}
				<div className="flex flex-wrap items-center justify-center gap-6">
					{FOOTER_NAV_LINKS.map((link) =>
						link.external ? (
							<a
								key={link.label}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
							>
								{link.label}
							</a>
						) : (
							<Link
								key={link.label}
								href={link.href}
								className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
							>
								{link.label}
							</Link>
						)
					)}
					<a
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
					>
						<GitBranch className="h-3.5 w-3.5" />
						GitHub
					</a>
				</div>

				{/* Copyright + status */}
				<div className="flex flex-col items-center gap-1.5 md:items-end">
				<div className="font-mono text-xs text-muted-foreground/60">
					{`\u00A9 ${new Date().getFullYear()} ${SITE_NAME}`}
				</div>
				<StatusBadge />
				</div>
			</div>
		</motion.footer>
	)
}
