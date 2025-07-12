import { useState, useEffect } from "react";
import { Grid, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { fetchUndrawMetadata, fetchAndStoreAllIllustrations, isDataFresh, getStoredIllustrations } from "./index";
import type { Illustration } from "./index";

export default function Command() {
  const [columns, setColumns] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);

  useEffect(() => {
    const loadIllustrations = async () => {
      try {
        setIsLoading(true);

        // Validate data in local storage.
        const isDataEnabled = await isDataFresh();

        // If data is valid, load from local storage; otherwise, fetch and store new data.
        if (isDataEnabled) {
          const storedData = await getStoredIllustrations();
          setIllustrations(storedData || []);
        } else {
          const metadata = await fetchUndrawMetadata();
          await fetchAndStoreAllIllustrations(metadata);

          // After storing, fetch the updated illustrations from Local Storage.
          const updatedData = await getStoredIllustrations();
          setIllustrations(updatedData || []);
          console.log("Illustrations fetched and stored successfully.");
        }
      } catch (error) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to Load Illustrations",
            message: error instanceof Error ? error.message : "An unknown error occurred.",
          });
      } finally {
        setIsLoading(false);
      }
    };

    loadIllustrations();
  }, []);

  return (
    <Grid
      columns={columns}
      inset={Grid.Inset.Small}
      isLoading={isLoading}
      searchBarAccessory={
        <Grid.Dropdown
          tooltip="Grid Item Size"
          storeValue
          onChange={(newValue) => {
            setColumns(parseInt(newValue));
            setIsLoading(false);
          }}
        >
          <Grid.Dropdown.Item title="Large" value={"3"} />
          <Grid.Dropdown.Item title="Medium" value={"5"} />
          <Grid.Dropdown.Item title="Small" value={"8"} />
        </Grid.Dropdown>
      }
    >
      {!isLoading &&
        illustrations.map((illustration) => (
          <Grid.Item
            key={illustration._id}
            content={{ value: { source: illustration.media }, tooltip: illustration.title }}
            title={illustration.title}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  url={`https://undraw.co/search/${illustration.newSlug}`}
                  title="Open in Undraw Website"
                />
                <Action.OpenInBrowser url={illustration.media} title="Open SVG Image" />
                <Action.CopyToClipboard content={illustration.media} title="Copy SVG URL" />
              </ActionPanel>
            }
          />
        ))}
    </Grid>
  );
}
