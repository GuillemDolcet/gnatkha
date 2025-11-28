<?php

namespace App\Repositories;

use App\Concerns\Contracts\FileStorageInterface;
use App\Models\Animal;
use App\Models\Pack;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class AnimalsRepository extends Repository
{
    public function __construct(
        protected FileStorageInterface $storage
    ) {}

    /**
     * The actual model class supporting the business logic.
     */
    public function getModelClass(): string
    {
        return Animal::class;
    }

    /**
     * *All* animals query context.
     */
    public function allContext(array $options = []): Builder
    {
        return $this->applyBuilderOptions($this->newQuery(), $options)->orderBy('id');
    }

    /**
     * Get *all* animals from the database.
     *
     * @return Collection<int,Animal>
     */
    public function all(array $options = []): Collection
    {
        return $this->allContext($options)->get();
    }

    /**
     * Get all animals for a pack.
     *
     * @return Collection<int,Animal>
     */
    public function allForPack(Pack $pack): Collection
    {
        return $pack->animals()->with(['type', 'defaultImage'])->get();
    }

    /**
     * Find an animal with its type loaded.
     */
    public function findWithType(Animal $animal): Animal
    {
        return $animal->load(['type', 'defaultImage', 'pack']);
    }

    /**
     * Instantiates a new Animal object.
     */
    public function build(array $attributes = []): Animal
    {
        return $this->make($attributes);
    }

    /**
     * Creates an Animal instance.
     */
    public function create(array $attributes, Pack $pack, ?UploadedFile $image = null): ?Animal
    {
        $attributes['pack_id'] = $pack->id;

        if ($image) {
            $attributes['image_path'] = $this->storeImage($image);
        }

        return $this->update($this->build(), $attributes);
    }

    /**
     * Updates an Animal instance.
     */
    public function update(Animal $instance, array $attributes = [], ?UploadedFile $image = null): ?Animal
    {
        if ($image) {
            // Delete old image if exists
            if ($instance->image_path) {
                $this->deleteImage($instance->image_path);
            }
            $attributes['image_path'] = $this->storeImage($image);
        }

        $instance->fill($attributes);

        $result = $instance->save();

        if (!$result) {
            return null;
        }

        return $instance;
    }

    /**
     * Deletes an Animal instance.
     */
    public function delete(Animal $animal): bool
    {
        if ($animal->image_path) {
            $this->deleteImage($animal->image_path);
        }

        return $animal->delete();
    }

    /**
     * Store an image and return its path.
     */
    protected function storeImage(UploadedFile $image): string
    {
        return $this->storage->store($image, 'animals');
    }

    /**
     * Delete an image by its path.
     */
    protected function deleteImage(string $path): bool
    {
        return $this->storage->delete($path);
    }

    /**
     * Get the public URL for an animal's image.
     */
    public function getImageUrl(Animal $animal): ?string
    {
        if (!$animal->image_path) {
            return null;
        }

        return $this->storage->url($animal->image_path);
    }
}
