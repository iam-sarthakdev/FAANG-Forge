const data = {
    code: `public class Main { public static void main(String[] args) { System.out.println("Hello from Codex!"); } }`,
    language: 'java'
};

fetch('https://api.codex.jaagrav.in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
