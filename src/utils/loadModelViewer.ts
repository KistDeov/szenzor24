let modelViewerLoad: Promise<void> | null = null;

export const loadModelViewer = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.customElements.get("model-viewer")) {
    return Promise.resolve();
  }

  if (!modelViewerLoad) {
    modelViewerLoad = import("@google/model-viewer")
      .then(() => undefined)
      .catch((error) => {
        if (window.customElements.get("model-viewer")) {
          return;
        }

        modelViewerLoad = null;
        throw error;
      });
  }

  return modelViewerLoad;
};
