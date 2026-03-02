"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const orgs = [
	{
		name: "Disutils Team",
		description:
		"Discord developer tools, bot frameworks, and community utilities. I ran this for about a year before winding it down to focus on VulnRadar.",
		url: "https://github.com/disutils",
		avatar: `/api/avatar?url=${encodeURIComponent("https://avatars.githubusercontent.com/u/184031343?v=4")}`,
		highlights: ["Disckit", "DisMusic", "Inactive"],
		color: "oklch(0.58 0.15 250)",
	},
	{
		name: "VulnRadar",
		description: "Security scanning platform. 175+ vulnerability checks with instant reports.",
		url: "https://vulnradar.dev",
		avatar: `/api/avatar?url=${encodeURIComponent("https://avatars.githubusercontent.com/u/261703628?v=4")}`,
		highlights: ["175+ Checks", "Instant Reports", "Fix Guidance"],
		color: "oklch(0.58 0.2 15)",
	},
]

export function OrgsSection() {
	const ref = useRef<HTMLElement>(null)
	const isInView = useInView(ref, { once: true, margin: "-60px" })

	return (
		<section ref={ref} id="orgs" className="relative py-24 md:py-32" style={{ overflow: "clip" }}>
			<div className="mx-auto max-w-6xl px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="mb-12"
				>
					<motion.span
						initial={{ opacity: 0, x: -10 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.4 }}
						className="font-mono text-sm text-primary"
					>
						{"// organizations"}
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 16 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.08 }}
						className="mt-2 text-3xl font-bold text-foreground md:text-4xl"
					>
						Where I Build
					</motion.h2>
					<motion.div
						initial={{ scaleX: 0 }}
						animate={isInView ? { scaleX: 1 } : {}}
						transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
						style={{ originX: 0 }}
						className="mt-2 h-1 w-16 rounded-full bg-primary"
					/>
					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.25 }}
						className="mt-4 max-w-lg text-muted-foreground"
					>
						Organizations I{"'"}ve founded and contributed to. Disutils Team is now inactive as I focus on VulnRadar.
					</motion.p>
				</motion.div>

				<div className="grid gap-6 md:grid-cols-2">
					{orgs.map((org, i) => (
						<motion.a
							key={org.name}
							href={org.url}
							target="_blank"
							rel="noopener noreferrer"
					initial={{ opacity: 0, y: 24 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.4, delay: 0.18 + i * 0.12, ease: [0.215, 0.61, 0.355, 1] }}
						whileTap={{ scale: 0.99 }}
						className="card-hover group relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8"
						>
							{/* Color gradient bg */}
						<motion.div
							className="pointer-events-none absolute inset-0"
							initial={{ opacity: 0.03 }}
							whileHover={{ opacity: 0.07 }}
							transition={{ duration: 0.15 }}
							style={{ background: `radial-gradient(circle at 70% 30%, ${org.color}, transparent 60%)` }}
						/>

						{/* Shimmer line on hover */}
						<motion.div
							className="pointer-events-none absolute inset-x-0 top-0 h-px"
							initial={{ scaleX: 0, opacity: 0 }}
							whileHover={{ scaleX: 1, opacity: 1 }}
							transition={{ duration: 0.15 }}
							style={{ background: `linear-gradient(90deg, transparent, ${org.color}, transparent)`, originX: 0.5 }}
						/>

							<div className="relative">
								<div className="mb-4 flex items-center gap-4">
								<img
									src={org.avatar}
									alt={`${org.name} avatar`}
									className="h-12 w-12 rounded-xl border border-border object-cover transition-transform duration-150 group-hover:scale-105"
								/>
									<div>
										<h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
											{org.name}
										</h3>
									</div>
									<motion.div
									className="ml-auto"
									initial={{ opacity: 0, x: -6 }}
									whileHover={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.15 }}
								>
										<ArrowRight className="h-5 w-5 text-primary" />
									</motion.div>
								</div>

								<p className="mb-5 text-sm leading-relaxed text-muted-foreground">{org.description}</p>

								<div className="flex flex-wrap gap-2">
									{org.highlights.map((h, hi) => (
										<motion.span
											key={h}
									initial={{ opacity: 0, y: 8 }}
										animate={isInView ? { opacity: 1, y: 0 } : {}}
										transition={{ delay: 0.3 + i * 0.12 + hi * 0.05, type: "spring", stiffness: 300, damping: 22 }}
											className="rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-foreground"
										>
											{h}
										</motion.span>
									))}
								</div>
							</div>
						</motion.a>
					))}
				</div>
			</div>
		</section>
	)
}
