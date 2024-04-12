import { Injectable } from '@nestjs/common'
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { CreateGenreDto } from './dto/create-genre.dto'
import { GenreModel } from './genre.model'
@Injectable()
export class GenreService {
  constructor(
    @InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
  ) {}

  async getAll(searchTerm?: string): Promise<DocumentType<GenreModel>[]> {
    let options = {}

    if (searchTerm) {
      options = {
        $or: [
          {
            name: new RegExp(searchTerm, 'i'),
          },
          {
            slug: new RegExp(searchTerm, 'i'),
          },
          {
            description: new RegExp(searchTerm, 'i'),
          },
        ],
      }
    }

    return this.GenreModel.find(options)
      .select('-updatedAt -__v')
      .sort({ createdAt: 'desc' })
      .exec()
  }

  async bySlug(slug: string): Promise<DocumentType<GenreModel>> {
    return this.GenreModel.findOne({ slug }).exec()
  }

  async getPopular(): Promise<DocumentType<GenreModel>[]> {
    return this.GenreModel.find()
      .select('-updatedAt -__v')
      .sort({ createdAt: 'desc' })
      .exec()
  }

  async getCollections() {
    const genres = await this.getAll()
    const collections = genres
    // TODO
    return collections
  }

  /* Admin area */

  async byId(id: string): Promise<DocumentType<GenreModel>> {
    return this.GenreModel.findById(id).exec()
  }

  async create(): Promise<Types.ObjectId> {
    const defaultValue: CreateGenreDto = {
      description: '',
      icon: '',
      name: '',
      slug: '',
    }
    const genre = await this.GenreModel.create(defaultValue)
    return genre._id
  }

  async update(
    id: string,
    dto: CreateGenreDto,
  ): Promise<DocumentType<GenreModel> | null> {
    return this.GenreModel.findByIdAndUpdate(id, dto, { new: true }).exec()
  }

  async delete(id: string): Promise<DocumentType<GenreModel> | null> {
    return this.GenreModel.findByIdAndDelete(id).exec()
  }
}
