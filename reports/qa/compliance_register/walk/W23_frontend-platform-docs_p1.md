# W23: walk 1 requirements on the frontend-platform-docs surface (part 1 of 1)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-132 | ARTEFACT | YES | `front_end_flowchart.md:22` | The client must play back the round's bookEvents strictly in the order the book supplies them, resolving each one before starting the next, so no later event (for example a win presentation) is shown ahead of an earlier one (for example the spin or reveal). |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-132

- source: `front_end_flowchart.md:22`
- platform text, verbatim: "It resolves them one after another with sequence() in the order of the bookEvents array. It means the sequence of bookEvents matters eminently and it determines the behaviors of the game. For example, we don’t want to see the “win” before “spin”, so we should put “win” after the “spin”."
- what it requires: The client must play back the round's bookEvents strictly in the order the book supplies them, resolving each one before starting the next, so no later event (for example a win presentation) is shown ahead of an earlier one (for example the spin or reveal).

