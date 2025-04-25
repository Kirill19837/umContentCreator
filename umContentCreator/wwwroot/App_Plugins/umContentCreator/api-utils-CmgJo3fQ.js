async function s(r, o) {
  const t = await fetch(r, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(o)
  });
  if (!t.ok) {
    const n = await t.text();
    throw new Error(`Error: ${t.status} - ${n}`);
  }
  return await t.json();
}
async function e(r, o) {
  const t = await fetch(r, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(o)
  });
  if (!t.ok) {
    const n = await t.text();
    throw new Error(`Error: ${t.status} - ${n}`);
  }
}
async function a(r) {
  const o = await fetch(r, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!o.ok) {
    const t = await o.text();
    throw new Error(`Error: ${o.status} - ${t}`);
  }
  return await o.json();
}
export {
  s as a,
  a as g,
  e as p
};
//# sourceMappingURL=api-utils-CmgJo3fQ.js.map
