# Photo folders

Add travel photos here and reference them from `src/data/trips.ts`.

Recommended structure:

```text
public/photos/
  tokyo-winter/
    cover.png
    001.jpg
    002.jpg
  osaka-food/
    cover.png
  fukuoka-spring/
    cover.png
```

Files inside `public` are served from the site root. For example:

```ts
cover: "/photos/tokyo-winter/cover.png"
```
