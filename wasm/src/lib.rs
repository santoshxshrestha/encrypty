use std::char;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn encrypty(key: String, message: String) -> String {
    message
        .chars()
        .map(|c| {
            char::from_u32(c as u32 ^ key.chars().map(|c| c as u32).fold(0, |acc, x| acc ^ x))
                .expect("Unicode conversion error")
        })
        .collect::<String>()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn is_not_empty() {
        let key = String::from("my_key");
        let message = String::from("Hello, World!");
        let encrypted = encrypty(key, message);
        assert!(!encrypted.is_empty());
    }

    #[test]
    fn encrypting() {
        let key = String::from("my_key");
        let message = String::from("Hello, World!");
        let encrypted = encrypty(key, message);
        assert_eq!(encrypted, String::from("tYPPS\u{10}\u{1c}kSNPX\u{1d}"))
    }

    #[test]
    fn decreypting() {
        let key = String::from("my_key");
        let cipher = String::from("tYPPS\u{10}\u{1c}kSNPX\u{1d}");
        let message = encrypty(key, cipher);
        assert_eq!(message, String::from("Hello, World!"))
    }
}
