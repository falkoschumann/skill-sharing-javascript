# Skill Sharing

## Domain

![Domain](./domain.png)

### Change user

- Updates user name

### User

- Anon is the default user
- Is stored user

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

## Users

```mermaid
classDiagram
    class User {
        username: String
    }
```

## Talks

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

    Talk *-- Comment: comments
```
