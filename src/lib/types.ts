// Type Definitions
type Post = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  categories: {
    edges: { node: Category }[];
  };
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  slug: string;
  date: string;
  categories: { edges: { node: { name: string; slug: string } }[] };
};

interface PaginationInfo {
  endCursor: string;
  hasNextPage: boolean;
}

type Category = {
  id: string;
  name: string;
  slug: string;
};

type GetPostsParams = {
  first?: number; // Số lượng bài viết cần lấy
  after?: string; // Con trỏ để lấy bài viết tiếp theo
  search?: string; // Từ khóa tìm kiếm
  categorySlug?: string; // Slug của category
};

type GetPostDetailParams = {
  slug: string;
};

interface GetPostsResponse {
  edges: { node: Post }[];
  pageInfo: PaginationInfo;
}

interface GetCategoriesResponse {
  categories: {
    edges: { node: Category }[];
  };
}

interface GetPostResponse {
  postBy: Post;
}
// type GetPostsResponse = {
//   edges: {
//     node: Post;
//     cursor: string;
//   }[];
//   pageInfo: {
//     hasNextPage: boolean;
//     endCursor: string;
//   };
// };
