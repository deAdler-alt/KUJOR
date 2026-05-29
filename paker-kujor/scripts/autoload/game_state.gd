extends Node

signal player_lock_changed(locked: bool)
signal weight_unlocked(weight_kg: int)
signal flag_changed(flag: String, value: bool)

const WEIGHT_LEVELS: Array[int] = [20, 40, 60, 80, 100, 120, 140]
const ALL_ITEMS: Array[String] = [
	"proteina",
	"chalk",
	"gazeta",
	"poster_golden",
	"lustro",
	"radio",
	"drzwi",
]

var player_locked: bool = false
var max_weight_unlocked: int = 20
var inventory: Array[String] = []
var flags: Dictionary = {}
var player_position: Vector2 = Vector2(320, 300)
var current_room: String = "basement"

var _chalk_bonus_active: bool = false


func _ready() -> void:
	reset_new_game()


func reset_new_game() -> void:
	player_locked = false
	max_weight_unlocked = 20
	inventory.clear()
	flags.clear()
	player_position = Vector2(320, 300)
	current_room = "basement"
	_chalk_bonus_active = false


func set_player_locked(locked: bool) -> void:
	if player_locked == locked:
		return
	player_locked = locked
	player_lock_changed.emit(locked)


func has_flag(flag: String) -> bool:
	return flags.get(flag, false)


func set_flag(flag: String, value: bool = true) -> void:
	flags[flag] = value
	flag_changed.emit(flag, value)


func add_item(item_id: String) -> void:
	if item_id in inventory:
		return
	inventory.append(item_id)
	if item_id == "chalk":
		_chalk_bonus_active = true


func has_item(item_id: String) -> bool:
	return item_id in inventory


func all_items_collected() -> bool:
	for item_id in ALL_ITEMS:
		if item_id not in inventory:
			return false
	return true


func get_press_gain_multiplier() -> float:
	if _chalk_bonus_active:
		return 1.1
	return 1.0


func is_weight_unlocked(weight_kg: int) -> bool:
	return weight_kg <= max_weight_unlocked


func get_unlocked_weights() -> Array[int]:
	var result: Array[int] = []
	for w in WEIGHT_LEVELS:
		if w <= max_weight_unlocked:
			result.append(w)
	return result


func unlock_next_weight(completed_kg: int) -> void:
	var idx := WEIGHT_LEVELS.find(completed_kg)
	if idx == -1:
		return
	if idx + 1 < WEIGHT_LEVELS.size():
		var next := WEIGHT_LEVELS[idx + 1]
		if next > max_weight_unlocked:
			max_weight_unlocked = next
			weight_unlocked.emit(next)
	if completed_kg == 140:
		set_flag("beat_140", true)


func to_save_dict() -> Dictionary:
	return {
		"max_weight_unlocked": max_weight_unlocked,
		"inventory": inventory.duplicate(),
		"flags": flags.duplicate(),
		"player_position": {"x": player_position.x, "y": player_position.y},
		"current_room": current_room,
	}


func from_save_dict(data: Dictionary) -> void:
	max_weight_unlocked = int(data.get("max_weight_unlocked", 20))
	inventory = Array(data.get("inventory", []))
	flags = Dictionary(data.get("flags", {}))
	var pos: Dictionary = data.get("player_position", {"x": 320, "y": 300})
	player_position = Vector2(float(pos.get("x", 320)), float(pos.get("y", 300)))
	current_room = str(data.get("current_room", "basement"))
	_chalk_bonus_active = has_item("chalk")
