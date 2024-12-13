# Skill Sharing

## Domain

![Domain](./domain.png)

### Change user

- Updates username

### User

- Anon is the default user
- Gets stored user

### Submit talk

- Adds talk to list

### Add comment

- Adds comment to an existing talk
- Reports an error if talk does not exists

### Delete talk

- Removes talk from list
- Ignores already removed talk

### Talks

- Lists all talks

### Metrics

- Count talks and presenters

## Aggregates

### Users

```mermaid
classDiagram
    class User {
        username: String
    }
```

### Talks

```mermaid
classDiagram
    direction LR

    class Talk {
        title: String
        presenter: String
        summary: String
    }

    class Comment {
        author: String
        message: String
    }

    Talk *--> Comment: comments
```

### Metrics

```mermaid
classDiagram
    class Talk {
        talksCount: Integer
        presentersCount: Integer
        commentsCount: Integer
    }
```

## Architecture

![Container Diagram for Skill Sharing System](./container.png)
