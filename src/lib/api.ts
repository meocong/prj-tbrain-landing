import { gql } from "@apollo/client";
import client from "./apollo-client";
import { ITEM_PER_PAGE } from "@/constants";

export const getPosts = async ({
  first = ITEM_PER_PAGE,
  after = "",
  search = "",
  categorySlug = "",
}: GetPostsParams): Promise<GetPostsResponse> => {
  const GET_POSTS = gql`
    query GetPosts(
      $first: Int!
      $after: String
      $search: String
      $categorySlug: String
    ) {
      posts(
        first: $first
        after: $after
        where: { search: $search, categoryName: $categorySlug }
      ) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
            categories {
              edges {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `;

  const { data } = await client.query<{ posts: GetPostsResponse }>({
    query: GET_POSTS,
    variables: {
      first,
      after,
      search,
      categorySlug,
    },
    context: {
      fetchOptions: {
        next: { revalidate: 5 }, // cho phép load lại dữ liệu sau 5 giây
      },
    },
  });
  return data!.posts;
};

// API getPostDetail (Bao gồm thông tin category)
export const getPostDetail = async ({
  slug,
}: GetPostDetailParams): Promise<PostDetail | null> => {
  const GET_POST_BY_SLUG = gql`
    query GetPostDetail($slug: String!) {
      postBy(slug: $slug) {
        id
        title
        content
        excerpt
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          edges {
            node {
              name
              slug
            }
          }
        }
      }
    }
  `;

  const { data } = await client.query<{ postBy: PostDetail }>({
    query: GET_POST_BY_SLUG,
    variables: {
      slug,
    },
    context: {
      fetchOptions: {
        next: { revalidate: 5 }, // cho phép load lại dữ liệu sau 5 giây
      },
    },
  });

  return data?.postBy ?? null;
};

// API getCategories (Danh sách category)
export const getCategories = async (): Promise<Category[]> => {
  const GET_CATEGORIES = gql`
    query GetCategories {
      categories {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
    }
  `;

  const { data } = await client.query<{
    categories: { edges: { node: Category }[] };
  }>({
    query: GET_CATEGORIES,
  });

  return data!.categories.edges.map((edge) => edge.node);
};
