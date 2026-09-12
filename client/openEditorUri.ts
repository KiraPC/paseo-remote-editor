import { Linking, Platform } from "react-native";

// This plugin typechecks without the DOM library. Declare only what this module uses.
declare const window: { location: { href: string } };

export async function openEditorUri(uri: string): Promise<void> {
  if (Platform.OS === "web") {
    // window.open() spawns a real browsing context, which the desktop app shows as its own
    // browser window while it resolves the custom scheme. Navigating the current window
    // instead hands the scheme straight to the OS without ever opening that window.
    window.location.href = uri;
    return;
  }
  await Linking.openURL(uri);
}
