import { runtimeConfig } from "@/lib/runtime-config";
import { useEffect } from "react";

const GA_TRACKING_ID = runtimeConfig.GA_TRACKING_ID;

export const useAnalytics = () => {
	useEffect(() => {
		if (GA_TRACKING_ID) {
			const script = document.createElement("script");
			script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
			script.async = true;
			document.head.appendChild(script);

			const inlineScript = document.createElement("script");
			inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}');
      `;
			document.head.appendChild(inlineScript);
		}
	}, []);
	return null;
};
