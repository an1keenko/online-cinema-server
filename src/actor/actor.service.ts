import { Injectable } from '@nestjs/common'
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { ActorModel } from './actor.model'
import { ActorDto } from './actor.dto'

@Injectable()
export class ActorService {
  constructor(
    @InjectModel(ActorModel)
    private readonly actorModel: ModelType<ActorModel>,
  ) {}

  async getAll(searchTerm?: string): Promise<DocumentType<ActorModel>[]> {
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
        ],
      }
    }

    return (
      this.actorModel
        .aggregate()
        .match(options)
        .lookup({
          from: 'Movie',
          localField: '_id',
          foreignField: 'actors',
          as: 'movies',
        })
        // .lookup({
        // 	from: 'Movie',
        // 	let: { id: '$_id' },
        // 	pipeline: [
        // 		{
        // 			$match: { $expr: { $in: ['$$id', '$actors'] } },
        // 		},
        // 	],
        // 	as: 'movies',
        // })
        .addFields({
          countMovies: { $size: '$movies' },
        })
        .project({ __v: 0, updatedAt: 0, movies: 0 })
        .sort({ createdAt: -1 })
        .exec()
    )

    // Remove some field
    // why count movies only 1
  }

  async bySlug(slug: string): Promise<DocumentType<ActorModel>> {
    return this.actorModel.findOne({ slug }).exec()
  }

  /* Admin area */

  async byId(id: string): Promise<DocumentType<ActorModel>> {
    return this.actorModel.findById(id).exec()
  }

  async create(): Promise<Types.ObjectId> {
    const defaultValue: ActorDto = {
      name: '',
      photo: '',
      slug: '',
    }
    const actor = await this.actorModel.create(defaultValue)
    return actor._id
  }

  async update(
    id: string,
    dto: ActorDto,
  ): Promise<DocumentType<ActorModel> | null> {
    return this.actorModel.findByIdAndUpdate(id, dto, { new: true }).exec()
  }

  async delete(id: string): Promise<DocumentType<ActorModel> | null> {
    return this.actorModel.findByIdAndDelete(id).exec()
  }
}
