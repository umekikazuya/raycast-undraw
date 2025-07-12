import { useState } from "react";
import { Grid, LocalStorage, ActionPanel, Action } from "@raycast/api";
import { fetchUndrawMetadata } from "./usecase/fetchUndrawPage";
import { fetchAndCacheAllIllustrations, Illustration, isCacheEnabled } from "./usecase/fetchIllustrationData";

export default function Command() {
  const [columns, setColumns] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);

  isCacheEnabled()
    .then((isEnabled) => {
      if (isEnabled) {
        LocalStorage.getItem("undraw-illustrations-data").then((data) => {
          setIllustrations(JSON.parse(typeof data === "string" ? data : "[]"));
          setIsLoading(false);
        });
      } else {
        console.log("Cache is not enabled, fetching illustrations...");
        fetchUndrawMetadata()
          .then((metadata) => {
            return fetchAndCacheAllIllustrations(metadata);
          })
          .then(() => {
            console.log("Illustrations fetched and cached successfully.");
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching illustrations:", error);
            setIsLoading(false);
          });
      }
    })
    .catch((error) => {
      console.error("Error checking cache status:", error);
      setIsLoading(false);
    });

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
                {/* SVG画像のURLをクリップボードにコピー */}
                <Action.CopyToClipboard content={illustration.media} title="Copy SVG URL" />
              </ActionPanel>
            }
          />
        ))}
    </Grid>
  );
}
