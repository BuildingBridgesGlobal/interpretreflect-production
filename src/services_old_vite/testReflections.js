// Quick test script to check Supabase reflections
import { supabase } from "../lib/supabase";

async function testLoadReflections() {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	console.log("Current user:", user);

	if (user) {
		const { data, error } = await supabase
			.from("reflection_entries")
			.select("*")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(10);

		console.log("Reflections from Supabase:", data);
		console.log("Error if any:", error);
		return data;
	}
}

// Export for use in console
window.testLoadReflections = testLoadReflections;
