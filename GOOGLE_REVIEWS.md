# Live Google Maps reviews

The site has a reviews section and an integration using the official Google Maps JavaScript Places library. It shows the current overall rating, rating count and up to five review excerpts with author links when configured. With no credentials, it shows a link to the clinic's Google Maps page; it never shows invented ratings or reviews.

## Activate

1. In Google Cloud, enable **Maps JavaScript API** and **Places API (New)** with billing. Create a browser API key restricted to the site's production domain (HTTP referrer restriction) and to those APIs.
2. Identify and verify the exact **Place ID** for the Breoris Medical listing at вул. Української Добровольчої армії, 2-Б, Дніпро. The integration rejects listings whose name does not match Breoris.
3. Put the restricted browser key and Place ID into `dist/google-reviews-config.js`. This is a browser key, so its restrictions matter. Do not use an unrestricted server key.
4. Publish the required site Terms of Use and Privacy Policy before activating Google Maps Platform content. Have the clinic approve the final text and current pricing before launch.
5. Test on the production or staging domain. A `file://` preview may not satisfy the key's website restriction.

The integration requests reviews only when the section nears the viewport and does not store or cache Google content. Review authors, Google Maps and third-party attributions appear alongside the reviews. Google returns at most five reviews; the full set remains available via Google Maps.

Sources: [Google Place Reviews](https://developers.google.com/maps/documentation/javascript/place-reviews), [Google attribution policy](https://developers.google.com/maps/documentation/javascript/policies), [Google API key setup](https://developers.google.com/maps/documentation/javascript/get-api-key).
