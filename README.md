# Encrypty

This repo is my playground for practicing encryption-related concepts and learning-by-doing with small examples.

Notes / disclaimer:

- This is not a full-fledged implementation and may not actually hash or encrypt content securely.
- Do not use this code to protect real secrets or production data.

> Note: This is the only important part of this repo

```rust
pub fn encrypty(key: String, message: String) -> String {
    message
        .chars()
        .map(|c| {
            char::from_u32(c as u32 ^ key.chars().map(|c| c as u32).fold(0, |acc, x| acc ^ x))
                .expect("Unicode conversion error")
        })
        .collect::<String>()
}
```
