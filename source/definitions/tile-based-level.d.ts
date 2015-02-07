
/** 
 * Single layer of Tiles in action.
 */
interface TileLayer {
    name: string;
    
    /** 
     * All the tiles on this layer can be collided with. In the future this is per tile / object information but for sake of 
     * quick prototyping, information is grouped in silly ways :)
     */
    canCollide: boolean;
    
    /**
     * Tiles. The tiles will be expanded into more reasonable, non hard-coded type once we start storing our 
     * Tiles in database and don't read them from slap-stick json files.
     */
    tiles: number[][];
}

/** 
 * The description of a single Level instance 
 */
interface TileBasedLevel {
    /**
     * Name of the actual level.
     */
    name: string;
    
    /**
     * Description for the level.
     */
    description: string;
    
    /** 
     *  World number
     */
    world: number;
    
    /** 
     * Level in that world; for example, 1-1: level 1 of world 1.
     */
    level: number;
    
    /** 
     * Tileset not in use in quick prototype phase
     */
    tileset: any;
    
    /**
     *  Layers containing the actual Tile details and layout of them 
     */
    tileLayers: TileLayer[];
}