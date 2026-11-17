import { useEffect, useRef } from 'react'

export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
	const sentinelRef = useRef<HTMLDivElement>(null)
	const onLoadMoreRef = useRef(onLoadMore)

	useEffect(() => {
		onLoadMoreRef.current = onLoadMore
	}, [onLoadMore])

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!enabled || !sentinel || typeof IntersectionObserver === 'undefined') return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					onLoadMoreRef.current()
				}
			},
			{ rootMargin: '400px 0px' },
		)
		observer.observe(sentinel)

		return () => observer.disconnect()
	}, [enabled])

	return sentinelRef
}
