export async function transferFirestoreWithNestedReferences(input) {
  const items = Array.isArray(input) ? input : [input];

  const result = await Promise.all(items.map(async (item) => {
    const resolvedData = await resolveReferencesRecursively(item.data());
    return {
      id: item.id,
      ...resolvedData,
    };
  }));

  return Array.isArray(input) ? result : result[0];
}

async function resolveReferencesRecursively(obj) {
  const result = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];

    if (isDocumentReference(value)) {
      try {
        const refSnap = await value.get(); // or getDoc(value) for modular
        if (refSnap.exists) {
          result[key] = {
            id: refSnap.id,
            ...(await resolveReferencesRecursively(refSnap.data()))
          };
        } else {
          result[key] = null;
        }
      } catch (error) {
        console.warn(`Failed to resolve reference for field '${key}':`, error);
        result[key] = null;
      }
    } else if (value && typeof value === 'object') {
      // Recurse through nested objects or arrays
      result[key] = await resolveReferencesRecursively(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// Helper
function isDocumentReference(val) {
  return val && typeof val === 'object' && typeof val.get === 'function' && typeof val.id === 'string';
}

export function skipForPaths(pathsToSkip, middleware) {
  return function (req, res, next) {
    const match = pathsToSkip.some(
      (path) =>
        req.path === path.path &&
        (!path.method || req.method.toLowerCase() === path.method.toLowerCase())
    );

    if (match) {
      req.role = "Basic";
      return next();
    }

    return middleware(req, res, next);
  };
}