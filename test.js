fetch('https://emkc.org/api/v2/piston/runtimes')
    .then(res => res.json())
    .then(data => console.log(data.slice(0, 5)))
    .catch(console.error);
