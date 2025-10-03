// Unregister all service workers to prevent caching issues
export async function unregisterAllServiceWorkers() {
	if ("serviceWorker" in navigator) {
		try {
			// Get all service worker registrations
			const registrations = await navigator.serviceWorker.getRegistrations();

			// Unregister each one
			for (const registration of registrations) {
				const success = await registration.unregister();
				console.log("Service worker unregistered:", success);
			}

			// Clear all caches
			if ("caches" in window) {
				const cacheNames = await caches.keys();
				await Promise.all(
					cacheNames.map((cacheName) => {
						console.log("Deleting cache:", cacheName);
						return caches.delete(cacheName);
					}),
				);
			}

			console.log("All service workers and caches cleared");
		} catch (error) {
			console.error("Error unregistering service workers:", error);
		}
	}
}

// Run immediately when imported
unregisterAllServiceWorkers();
