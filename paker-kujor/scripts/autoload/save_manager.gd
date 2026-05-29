extends Node

const SAVE_PATH := "user://save_slot_0.json"

signal save_completed
signal load_completed(success: bool)


func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


func save_game() -> bool:
	var data := {
		"version": 1,
		"timestamp": Time.get_unix_time_from_system(),
		"game_state": GameState.to_save_dict(),
	}
	var json := JSON.stringify(data, "\t")
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_error("SaveManager: nie można zapisać — %s" % error_string(FileAccess.get_open_error()))
		return false
	file.store_string(json)
	file.close()
	save_completed.emit()
	return true


func load_game() -> bool:
	if not has_save():
		load_completed.emit(false)
		return false
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		load_completed.emit(false)
		return false
	var text := file.get_as_text()
	file.close()
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		push_error("SaveManager: uszkodzony plik zapisu.")
		load_completed.emit(false)
		return false
	var gs: Dictionary = parsed.get("game_state", {})
	GameState.from_save_dict(gs)
	load_completed.emit(true)
	return true


func delete_save() -> void:
	if has_save():
		DirAccess.remove_absolute(SAVE_PATH)
