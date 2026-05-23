import { callAction, type PageResult } from './cloudbase'
import type {
  User,
  Address,
  CollectionItem,
  Coupon,
} from '@/types/user'

export async function login(code: string): Promise<{ token: string; userInfo: User }> {
  return callAction<{ token: string; userInfo: User }>('user', 'login', { code })
}

export async function getUserInfo(): Promise<User> {
  return callAction<User>('user', 'info', {})
}

export interface UpdateUserInfoData {
  nickname?: string
  avatar?: string
  phone?: string
  gender?: string
  bio?: string
}

export async function updateUserInfo(
  data: UpdateUserInfoData,
): Promise<User> {
  return callAction<User>('user', 'update', { data })
}

export async function getAddresses(): Promise<Address[]> {
  return callAction<Address[]>('user', 'addresses', {})
}

export async function addAddress(
  data: Omit<Address, 'id' | 'userId'>,
): Promise<Address> {
  return callAction<Address>('user', 'address-add', { data })
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, 'id' | 'userId'>>,
): Promise<Address> {
  return callAction<Address>('user', 'address-update', { id, data })
}

export async function deleteAddress(id: string): Promise<void> {
  return callAction<void>('user', 'address-delete', { id })
}

export interface CollectionListParams {
  page?: number
  pageSize?: number
  targetType?: string
}

export async function getCollections(
  params: CollectionListParams = {},
): Promise<PageResult<CollectionItem>> {
  return callAction<PageResult<CollectionItem>>('user', 'collections', { params })
}

export interface AddCollectionData {
  targetType: string
  targetId: string
}

export async function addCollection(
  data: AddCollectionData,
): Promise<CollectionItem> {
  return callAction<CollectionItem>('user', 'collection-add', { data })
}

export async function removeCollection(id: string): Promise<void> {
  return callAction<void>('user', 'collection-remove', { id })
}

export async function getCoupons(): Promise<Coupon[]> {
  return callAction<Coupon[]>('user', 'coupons', {})
}
