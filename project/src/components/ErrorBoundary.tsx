import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						padding: "20px",
						background: "white",
						minHeight: "100vh",
						color: "black",
					}}
				>
					<h1 style={{ color: "red" }}>Something went wrong</h1>
					<details style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
						<summary>Error details (click to expand)</summary>
						{this.state.error && this.state.error.toString()}
						<br />
						{this.state.error?.stack}
					</details>
					<button
						onClick={() => (window.location.href = "/")}
						style={{
							marginTop: "20px",
							padding: "10px 20px",
							background: "#3B82F6",
							color: "white",
							border: "none",
							borderRadius: "5px",
							cursor: "pointer",
						}}
					>
						Return to Home
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
