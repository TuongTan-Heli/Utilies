export async function transferFirestoreWithNestedReferences(
  input,
  removedFields = []
) {
  const items = Array.isArray(input) ? input : [input];

  const results = await Promise.all(
    items.map(async (doc) => {
      const data = await resolveRecursively(
        doc.data(),
        new Set(removedFields)
      );

      return {
        id: doc.id,
        ...data,
      };
    })
  );

  return Array.isArray(input) ? results : results[0];
}

async function resolveRecursively(obj, removedFields, path = "") {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return Promise.all(
      obj.map(item =>
        resolveRecursively(item, removedFields, path)
      )
    );
  }

  if (typeof obj !== "object") return obj;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (removedFields.has(key) || removedFields.has(currentPath)) {
      continue;
    }

    if (isDocumentReference(value)) {
      try {
        const snap = await value.get();
        result[key] = snap.exists
          ? {
              id: snap.id,
              ...(await resolveRecursively(
                snap.data(),
                removedFields,
                currentPath
              )),
            }
          : null;
      } catch (e) {
        console.warn(`Failed to resolve reference '${currentPath}'`, e);
        result[key] = null;
      }
      continue;
    }

    result[key] = await resolveRecursively(
      value,
      removedFields,
      currentPath
    );
  }

  return result;
}


export function validateRes(obj) {
  if (Array.isArray(obj)) {
    return obj.map(validateRes);
  }

  if (obj !== null && typeof obj === 'object') {
    const result = {};

    for (const key in obj) {
      if (key === 'Password') {
        continue;
      }

      const value = obj[key];

      if (value !== null && typeof value === 'object') {
        result[key] = validateRes(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  return obj;
}

// Helper
function isDocumentReference(val) {
  return val && typeof val === 'object' && typeof val.get === 'function' && typeof val.id === 'string';
}

export function skipForPaths(pathsToSkip, middleware) {
  return function (req, res, next) {
    const match = pathsToSkip.some((p) => {
      if (p.method && req.method.toLowerCase() !== p.method.toLowerCase()) {
        return false;
      }

      if (p.regex) {
        return p.regex.test(req.path);
      }

      if (p.startsWith) {
        return req.path.startsWith(p.path);
      }

      return req.path === p.path;
    });

    if (match) {
      req.role = "Basic";
      return next();
    }

    return middleware(req, res, next);
  };
}