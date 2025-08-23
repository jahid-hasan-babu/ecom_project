export const searchFilter = (search: string | null, filter?: string | null) => {
  if (!search) {
    return undefined;
  }

  const filters: any = {};

  if (search) {
    filters.OR = [{ name: { contains: search, mode: "insensitive" } }];
  }


  return filters;
};

const searchFilterForService = (filter: string) => {
  return {
    filter: filter, // Return just the string value
  };
};

const bookingFilter = (filter: string | null) => {
  if (!filter) {
    return undefined;
  }

  const filters: any = {};

  if (filter) {
    filters.status = filter;
  }
};

export { searchFilterForService, bookingFilter };
